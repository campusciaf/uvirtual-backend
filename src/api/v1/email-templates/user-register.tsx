import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface UserRegisterEmailProps {
  userDetails: {
    nameUser: string;
    emailUser: string;
  };
  tenantCode?: string;
}

export const UserRegisterEmail = ({
  userDetails,
  tenantCode,
}: UserRegisterEmailProps) => {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Bienvenido a Kuizi, {userDetails.nameUser} — Tu cuenta ha sido creada
      </Preview>{' '}
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logoText}>🦝 kuizi</Text>
          </Section>

          <Section style={styles.orangeBar} />

          <Section style={styles.content}>
            <Heading style={styles.heading}>
              ¡Bienvenido, {userDetails.nameUser}!
            </Heading>

            <Text style={styles.subheading}>
              Tu cuenta en Kuizi ha sido creada con éxito.
            </Text>

            <Text style={styles.paragraph}>
              Ya puedes acceder a la plataforma. Usa el correo con el que fuiste
              registrado para iniciar sesión:
            </Text>

            <Section style={styles.credentialCard}>
              <Text style={styles.labelText}>✉ Correo electrónico</Text>
              <Text style={styles.valueText}>{userDetails.emailUser}</Text>
            </Section>

            <Section style={styles.buttonWrapper}>
              <Button
                href={`https://${tenantCode}.kuizi.com/login`}
                style={styles.button}
              >
                Acceder a tu cuenta →
              </Button>
            </Section>

            <Hr style={styles.divider} />

            <Section style={styles.securityNote}>
              <Text style={styles.securityText}>
                🔒 <strong>Por seguridad</strong>, te recomendamos cambiar tu
                contraseña una vez que hayas iniciado sesión por primera vez.
              </Text>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Kuizi. Todos los derechos reservados.
            </Text>
            <Text style={styles.footerText}>
              ¿Tienes dudas?{' '}
              <Link href="mailto:soporte@kuizi.com" style={styles.footerLink}>
                Contáctanos
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#f0f0f0',
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    margin: '0',
    padding: '32px 0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: '28px 40px',
    textAlign: 'center',
  },
  logoText: {
    color: '#f97316',
    fontSize: '26px',
    fontWeight: '800',
    margin: '0',
    letterSpacing: '-0.5px',
  },
  orangeBar: {
    backgroundColor: '#f97316',
    height: '4px',
  },
  content: {
    backgroundColor: '#ffffff',
    padding: '40px 48px 32px',
  },
  heading: {
    color: '#1a1a2e',
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  subheading: {
    color: '#f97316',
    fontSize: '15px',
    fontWeight: '600',
    textAlign: 'center',
    margin: '0 0 20px',
  },
  paragraph: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.6',
    textAlign: 'center',
    margin: '0 0 24px',
  },
  credentialCard: {
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
    padding: '12px 16px',
  },
  labelText: {
    color: '#1e40af',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 4px',
  },
  valueText: {
    color: '#1e3a8a',
    fontSize: '15px',
    fontWeight: '600',
    margin: '0',
  },
  buttonWrapper: {
    textAlign: 'center',
    padding: '28px 0 8px',
  },
  button: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    padding: '14px 36px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  divider: {
    borderColor: '#f3f4f6',
    margin: '8px 0 24px',
  },
  securityNote: {
    backgroundColor: '#fefce8',
    borderRadius: '8px',
    border: '1px solid #fde68a',
    padding: '12px 16px',
  },
  securityText: {
    color: '#92400e',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: '0',
  },
  footer: {
    backgroundColor: '#1a1a2e',
    padding: '24px 40px',
    textAlign: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '12px',
    margin: '4px 0',
    textAlign: 'center',
  },
  footerLink: {
    color: '#f97316',
    textDecoration: 'none',
  },
};

export default UserRegisterEmail;
