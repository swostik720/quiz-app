import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is required in .env.local");
}

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGO_URI, { bufferCommands: false });

  const userEmail = process.env.SEED_USER_EMAIL || "user@example.com";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const userPassword = process.env.SEED_USER_PASSWORD || "Password@123";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

  const [userHash, adminHash] = await Promise.all([
    bcrypt.hash(userPassword, 10),
    bcrypt.hash(adminPassword, 10),
  ]);

  await User.findOneAndUpdate(
    { email: userEmail },
    {
      fullName: "Seed User",
      email: userEmail,
      password: userHash,
      role: "user",
      isVerified: true,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      fullName: "Seed Admin",
      email: adminEmail,
      password: adminHash,
      role: "admin",
      isVerified: true,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log("Seeded users:");
  console.log(`- user: ${userEmail}`);
  console.log(`- admin: ${adminEmail}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
