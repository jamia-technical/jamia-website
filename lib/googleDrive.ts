import { google } from "googleapis";
import { Readable } from "stream";

const getPrivateKey = () => {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  return privateKey?.replace(/\\n/g, "\n");
};

export const getDriveClient = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google Drive credentials are missing. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
};

export const uploadPublicationPdfToDrive = async (file: File) => {
  const folderId = process.env.GOOGLE_DRIVE_PUBLICATION_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_PUBLICATION_FOLDER_ID is not configured.");
  }

  const drive = getDriveClient();
  const bytes = Buffer.from(await file.arrayBuffer());

  const result = await drive.files.create({
    requestBody: {
      name: `${Date.now()}-${file.name}`,
      mimeType: "application/pdf",
      parents: [folderId],
    },
    media: {
      mimeType: "application/pdf",
      body: Readable.from(bytes),
    },
    fields: "id,name,size,mimeType",
    supportsAllDrives: true,
  });

  if (!result.data.id) {
    throw new Error("Google Drive upload completed without a file id.");
  }

  return {
    id: result.data.id,
    name: result.data.name,
    size: result.data.size,
    url: `/api/publications/file/${result.data.id}`,
  };
};

export const deletePublicationPdfFromDrive = async (fileId: string) => {
  const drive = getDriveClient();
  await drive.files.delete({ fileId, supportsAllDrives: true });
};

export const getDriveAccessToken = async (
  scopes = ["https://www.googleapis.com/auth/drive.readonly"]
) => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error("Google Drive credentials are missing.");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes,
  });

  const token = await auth.authorize();
  if (!token.access_token) {
    throw new Error("Could not create Google Drive access token.");
  }

  return token.access_token;
};

export const createPublicationPdfUploadSession = async (fileName: string) => {
  const folderId = process.env.GOOGLE_DRIVE_PUBLICATION_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_PUBLICATION_FOLDER_ID is not configured.");
  }

  const token = await getDriveAccessToken([
    "https://www.googleapis.com/auth/drive",
  ]);
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "application/pdf",
      },
      body: JSON.stringify({
        name: `${Date.now()}-${fileName}`,
        mimeType: "application/pdf",
        parents: [folderId],
      }),
    }
  );

  const uploadUrl = response.headers.get("location");

  if (!response.ok || !uploadUrl) {
    const message = await response.text();
    throw new Error(message || "Unable to create Google Drive upload session.");
  }

  return uploadUrl;
};
