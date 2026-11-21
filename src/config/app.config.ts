export const appConfig = {
  name: 'app-receba',
  title: 'Receba!!',
  author: {
    name: 'David Ferreira',
    url: 'https://www.linkedin.com/in/davidfdesousa/',
  },
  features: {
    /** Metronome hidden for now: the controls do not show it and it never plays. */
    metronome: false,
  },
} as const;

export type AppConfig = typeof appConfig;
