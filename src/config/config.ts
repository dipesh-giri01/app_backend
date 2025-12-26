const AppConfig = {
    appUrl: process.env.APP_URL,
    apiUrl: process.env.API_URL,
    frontUrl: process.env.FRONT_URL,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET_KEY,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET_KEY
};

const CloudinaryConfig = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
};

const SmtpConfig = {
    provider: process.env.SMTP_PROVIDER,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM
}

export default { AppConfig, CloudinaryConfig , SmtpConfig };