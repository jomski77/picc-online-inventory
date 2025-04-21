import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      <h1 className='text-4xl font-bold mb-4 dark:text-white'>404 - Page Not Found</h1>
      <p className='text-gray-500 dark:text-gray-400 mb-8'>The page you are looking for doesn't exist.</p>
      <Button gradientDuoTone='purpleToPink'>
        <Link to='/'>Go back home</Link>
      </Button>
    </div>
  );
} 