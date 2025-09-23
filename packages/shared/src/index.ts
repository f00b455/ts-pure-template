export const greet = (name: string): string => {
  if (!name.trim()) {
    throw new Error('Name cannot be empty');
  }
  return `Hello, ${name}! HUHU`;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};
