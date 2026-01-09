const DEMO_ID = "73a0a87f-7f82-4ede-8c42-5868f840f397";

/**
 * Used during login to prevent timing attacks. 
 * Provides a hash for bcrypt.compare to work against even if the user doesn't exist.
 */
const DUMMY_HASH = "$2b$10$C69YVnRAQ9.D.S.N1010101010101010101010101010101010";

export { DEMO_ID, DUMMY_HASH }