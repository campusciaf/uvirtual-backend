import {
  Html,
  Body,
  Head,
  Tailwind,
  Preview,
  Text,
  Section,
  Container,
} from '@react-email/components';
import * as React from 'react';

interface ChatExportEmailProps {
  details: {
    userName: string;
    agentName: string;
    messages: { role: string; content: string }[];
  };
}

export const ChatExportEmail = ({ details }: ChatExportEmailProps) => (
  <Html>
    <Tailwind>
      <>
        <Head />
        <Preview>Tu conversación con {details.agentName}</Preview>

        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white p-6 rounded-lg shadow-md">
            <Text className="text-xl font-semibold text-gray-800">
              Conversación con {details.agentName}
            </Text>

            <Section className="mt-4">
              {details.messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <Text
                    className={`text-sm ${msg.role === 'user' ? 'text-blue-700' : 'text-green-700'
                      }`}
                  >
                    <strong>{msg.role === 'user' ? 'Tú:' : 'Agente:'}</strong>{' '}
                    {msg.content}
                  </Text>
                </div>
              ))}
            </Section>
          </Container>
        </Body>
      </>
    </Tailwind>
  </Html>
);