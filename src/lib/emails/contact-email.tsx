import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactEmail = ({
  name,
  email,
  subject,
  message,
}: ContactEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Nouveau message de contact : {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Nouveau message de contact</Heading>
          </Section>

          <Section style={content}>
            <Section style={infoBox}>
              <Text style={label}>Nom :</Text>
              <Text style={value}>{name}</Text>

              <Text style={label}>Email :</Text>
              <Text style={value}>{email}</Text>

              <Text style={label}>Sujet :</Text>
              <Text style={value}>{subject}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={messageBox}>
              <Text style={messageLabel}>Message :</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 24px",
  backgroundColor: "#f2bf26",
  borderRadius: "8px 8px 0 0",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0",
  textAlign: "center" as const,
};

const content = {
  padding: "32px 24px",
};

const infoBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "0 0 24px",
  border: "1px solid #e9ecef",
};

const label = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: "600",
  margin: "12px 0 4px",
};

const value = {
  color: "#333333",
  fontSize: "16px",
  margin: "0 0 16px",
};

const divider = {
  borderColor: "#e9ecef",
  margin: "24px 0",
};

const messageBox = {
  margin: "24px 0",
};

const messageLabel = {
  color: "#666666",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const messageText = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

export default ContactEmail;
