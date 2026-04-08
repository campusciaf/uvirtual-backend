import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  token: string;
}

export const PasswordResetEmail = ({ token }: PasswordResetEmailProps) => {
  const resetUrl = `https://ia.bybinary.co/reset-password/${token}`;

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: '#ed6a22',
                offwhite: '#fafbfb',
              },
              spacing: {
                0: '0px',
                20: '20px',
                45: '45px',
              },
            },
          },
        }}
      >
        <>
          <Preview>Restablece tu contraseña en Bybinary</Preview>
          <Body className="bg-offwhite font-sans text-base">
            <Img
              src="https://ia.bybinary.co/logo.png"
              width="180"
              height="120"
              alt="Bybinary"
              className="mx-auto my-20"
            />
            <Container className="bg-white p-45 rounded-lg shadow-md">
              <Heading className="my-0 text-center leading-8 text-brand">
                Restablece tu contraseña
              </Heading>

              <Section className="mt-6">
                <Text className="text-base text-gray-700">
                  Hemos recibido una solicitud para restablecer tu contraseña en{' '}
                  <strong>Bybinary</strong>.
                </Text>
                <Text className="text-base text-gray-700 mt-2">
                  Haz clic en el botón de abajo para continuar. Este enlace será
                  válido solo por un tiempo limitado.
                </Text>
              </Section>

              <Section className="text-center mt-8">
                <Button
                  className="rounded-lg bg-brand px-[22px] py-3 text-white font-semibold"
                  href={resetUrl}
                >
                  Restablecer contraseña
                </Button>
              </Section>

              <Section className="mt-10 text-gray-600 text-sm">
                <Text>
                  Si tú no solicitaste este cambio, puedes ignorar este mensaje.
                  Tu contraseña actual seguirá siendo la misma.
                </Text>
              </Section>
            </Container>

            <Container className="mt-10">
              <Text className="text-center text-gray-400 text-sm">
                © {new Date().getFullYear()} Bybinary. Todos los derechos
                reservados.
              </Text>
              <Text className="text-center text-gray-400 text-sm mt-2">
                Si tienes dudas, contáctanos en{' '}
                <Link
                  href="mailto:soporte@bybinary.co"
                  className="text-brand underline"
                >
                  soporte@bybinary.co
                </Link>
              </Text>
            </Container>
          </Body>
        </>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
