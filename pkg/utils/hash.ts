import bcrypt from "bcrypt"

export async function hashCreate(str: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(str, salt)
}

export async function hashCompare(str1: string, str2: string) {
  return bcrypt.compare(str1, str2)
}
