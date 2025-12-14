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

interface WelcomeEmailProps {
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export const WelcomeEmail = ({
  email,
  tempPassword,
  loginUrl,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur Yallo - Vos identifiants de connexion</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Bienvenue sur Yallo !</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Votre compte a été créé avec succès. Vous pouvez maintenant accéder
              à votre espace restaurateur.
            </Text>

            <Section style={credentialsBox}>
              <Text style={label}>Email :</Text>
              <Text style={value}>{email}</Text>

              <Text style={label}>Mot de passe temporaire :</Text>
              <Text style={password}>{tempPassword}</Text>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️ <strong>IMPORTANT</strong> : Pour des raisons de sécurité,
                vous devrez changer ce mot de passe lors de votre première
                connexion.
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Link href={loginUrl} style={button}>
                Se connecter
              </Link>
            </Section>

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

const credentialsBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
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
  fontFamily: "monospace",
};

const password = {
  color: "#f2bf26",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
  fontFamily: "monospace",
  letterSpacing: "2px",
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

const footer = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "32px 0 0",
  textAlign: "center" as const,
};

export default WelcomeEmail;
