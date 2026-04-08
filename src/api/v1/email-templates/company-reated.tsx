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

interface CompanyCreatedEmailProps {
  details: {
    adminName: string;
    adminEmail: string;
    companyName: string;
    companyPassword: string;
  };
}

export const CompanyCreatedEmail = ({ details }: CompanyCreatedEmailProps) => {
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
          <Preview>Tu empresa {details.companyName} ha sido creada 🚀</Preview>
          <Body className="bg-offwhite font-sans text-base">
            <Img
              src={`https://ia.bybinary.co/logo.png`}
              width="180"
              height="120"
              alt="Bybinary"
              className="mx-auto my-20"
            />
            <Container className="bg-white p-45 rounded-lg shadow-md">
              <Heading className="my-0 text-center leading-8 text-brand">
                ¡Felicidades, {details.adminName}!
              </Heading>

              <Section className="mt-6">
                <Text className="text-base text-gray-700">
                  Tu empresa <strong>{details.companyName}</strong> ha sido creada
                  con éxito en
                  <strong>Bybinary</strong>.
                </Text>
                <Text className="text-base text-gray-700 mt-2">
                  Se te ha asignado el rol de <strong>Super Administrador</strong>
                  , con el cual podrás gestionar usuarios, agentes y toda la
                  configuración de tu empresa.
                </Text>
                <Text className="text-base mt-4">
                  <strong>Correo de acceso:</strong> {details.adminEmail}
                </Text>
                <Text className="text-base mt-4">
                  <strong>Contraseña:</strong> {details.companyPassword}
                </Text>
              </Section>

              <Section className="text-center mt-8">
                <Button
                  className="rounded-lg bg-brand px-[22px] py-3 text-white font-semibold"
                  href="https://ia.bybinary.co/"
                >
                  Acceder a la plataforma
                </Button>
              </Section>

              <Section className="mt-10 text-gray-600 text-sm">
                <Text>
                  Te recomendamos cambiar tu contraseña en el primer inicio de
                  sesión para mayor seguridad.
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

export default CompanyCreatedEmail;
