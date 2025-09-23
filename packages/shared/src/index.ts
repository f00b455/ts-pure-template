export const greet = (name: string): string => {
  if (!name.trim()) {
    return 'Error: Name cannot be empty';
  }
  return `Hello, ${name}! HUHU`;
};

export const formatDate = (date: Readonly<Date>): string => {
  return date.toISOString().split('T')[0];
};

export type User = Readonly<{
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}>;
