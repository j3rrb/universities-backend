import { genSalt, hash } from 'bcrypt';

export const generatePassword = async (
  rawString: string,
): Promise<{ salt: string; hash: string }> => {
  const salt = await genSalt(10);
  const generatedHash = await hash(rawString, salt);

  return { salt, hash: generatedHash };
};
