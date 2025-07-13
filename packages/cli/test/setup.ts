// Global test setup
export default async () => {
  console.log('\nSetting up test environment...\n');
  
  // Set test environment variables if needed
  process.env.NODE_ENV = 'test';
};