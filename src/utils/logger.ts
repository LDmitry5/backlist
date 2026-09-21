const logger = {
  error: (error: unknown, context?: string): void => {
    const message = context ? `${context}: ${String(error)}` : String(error);

    console.error(message);
  },
};

export default logger;
