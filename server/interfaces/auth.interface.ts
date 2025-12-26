type Roles = 'admin' | 'user' | 'guest';

interface RegisterInput {
    email: string
    password: string
    firstName?: string,
    lastName?: string
}

export { Roles, RegisterInput }