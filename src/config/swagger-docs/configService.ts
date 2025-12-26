import dotenv from "dotenv";
dotenv.config();

export const configService = {
  getDocumentationUsername: () => process.env.DOCS_USERNAME ,
  getDocumentationPassword: () => process.env.DOCS_PASSWORD ,
  getPort: () => process.env.PORT || 5000,
};
