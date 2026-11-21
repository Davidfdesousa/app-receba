export const appConfig = {
  name: 'app-receba',
  title: 'Receba!!',
  author: {
    name: 'David Ferreira',
    url: 'https://www.linkedin.com/in/davidfdesousa/',
  },
} as const;

export type AppConfig = typeof appConfig;
