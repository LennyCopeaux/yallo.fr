import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  email: string;
  resetToken: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  email,
  resetToken,
  resetUrl,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe Yallo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Réinitialisation de mot de passe</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Vous avez demandé la réinitialisation de votre mot de passe pour
              votre compte Yallo.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Email concerné :</strong> {email}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Link href={resetUrl} style={button}>
                Réinitialiser mon mot de passe
              </Link>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️ <strong>IMPORTANT</strong> : Ce lien est valide pendant 1 heure.
                Si vous n&apos;avez pas demandé cette réinitialisation, ignorez cet email.
              </Text>
            </Section>

            <Text style={footer}>
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              <br />
              <Link href={resetUrl} style={link}>
                {resetUrl}
              </Link>
            </Text>

            <Text style={footer}>
              À bientôt,
              <br />
              L&apos;équipe Yallo
            </Text>
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

const paragraph = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const infoBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e9ecef",
};

const infoText = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f2bf26",
  borderRadius: "8px",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const warningBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffc107",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const link = {
  color: "#f2bf26",
  textDecoration: "underline",
  fontSize: "14px",
};

const footer = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default ResetPasswordEmail;

