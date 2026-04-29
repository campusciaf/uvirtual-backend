import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get<string>('aws.region') as string,
      credentials: {
        accessKeyId: configService.get<string>('aws.accessKeyId') as string,
        secretAccessKey: configService.get<string>('aws.secretAccessKey') as string,
      },
    });

    this.bucket = configService.get<string>('aws.s3BucketName') as string;
  }

  /**
   * Sube una imagen de firma desde base64
   * @param base64Data - Imagen en formato base64
   * @param metadata - Información para construir la ruta
   * @returns Key de la imagen en S3
   */
  async uploadSignature(
    base64Data: string,
    metadata: {
      headquarters_id: string;
      client_id: string;
      entry_type: 'ingreso' | 'salida';
    }
  ): Promise<string> {
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    const year = new Date().getFullYear();
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${uuid()}.png`;

    const key = `${metadata.headquarters_id}/${metadata.client_id}/${year}/${metadata.entry_type}/${date}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      Metadata: {
        uploadedAt: new Date().toISOString(),
        entryType: metadata.entry_type,
      }
    });

    await this.s3Client.send(command);
    return key;
  }

  /**
   * Sube un archivo tradicional (mantener compatibilidad)
   * @param file El archivo capturado por Multer
   * @param folderPath (Opcional) Ruta de S3. Por defecto 'uploads'
   */
  async uploadFile(file: any, folderPath: string = 'uploads'): Promise<string> {
    const normalizedPath = folderPath.replace(/\/+$/, ''); // Evitar slashes al final
    const safeFileName = file.originalname.replace(/\s+/g, '_'); // Reemplazar espacios
    const key = `${normalizedPath}/${uuid()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return key;
  }

  /**
   * Obtiene URL firmada para acceder a una imagen
   */
  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
  }

  /**
   * Elimina un archivo de S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Genera URL pre-firmada para upload directo (opcional)
   * @param fileName Nombre original del archivo
   * @param contentType Tipo MIME (ej. 'application/pdf')
   * @param folderPath (Opcional) Ruta de S3. Por defecto 'uploads'
   */
  async generateUploadPresignedUrl(
    fileName: string,
    contentType: string,
    folderPath: string = 'uploads'
  ): Promise<{ url: string; key: string }> {
    const normalizedPath = folderPath.replace(/\/+$/, '');
    const safeFileName = fileName.replace(/\s+/g, '_');
    const key = `${normalizedPath}/${uuid()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    return { url, key };
  }

  /**
   * Prueba la conexión a S3
   */
  async testConnection(): Promise<boolean> {
    try {
      const command = new HeadBucketCommand({
        Bucket: this.bucket,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: Error | any) {
      console.error('❌ Error conectando a S3:', error);
      return false;
    }
  }

  async seeStructure(prefix = "", nivel = 0) {
    const indent = "  ".repeat(nivel);

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      Delimiter: "/"
    });

    const response = await this.s3Client.send(command);

    if (response.CommonPrefixes) {
      for (const prefixObj of response.CommonPrefixes) {
        if (!prefixObj.Prefix) continue;
        const folderName = prefixObj.Prefix.slice(prefix.length);
        console.log(`${indent}📁 ${folderName}`);

        await this.seeStructure(prefixObj.Prefix, nivel + 1);
      }
    }
    if (response.Contents) {
      response.Contents.forEach(item => {
        if (item.Key && item.Key !== prefix) {
          const fileName = item.Key.slice(prefix.length);
          console.log(`${indent}📄 ${fileName} (${this.formatBytes(item.Size)})`);
        }
      });
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}