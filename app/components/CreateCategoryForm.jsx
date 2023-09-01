import { createCategory, publishCategory } from '@/lib';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 } from 'uuid';

const CreateCategoryForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [show, setShow] = useState(true);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const router = useRouter();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleShowChange = (event) => {
    setShow(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreatingCategory(true);
    const slug = v4();
    const categoryDetails = { name, slug, show, description };
    const createdCategory = await createCategory(categoryDetails);
    await publishCategory(createdCategory.createCategory.id);
    setCreatingCategory(false);
    router.refresh();
    setName('');
    setDescription('');
  };

  return (
    <div className="max-w-md mx-auto bgColor fontColor rounded-lg shadow-lg p-6 mb-5 border-2 borderColor">
      <h1 className="text-2xl font-semibold mb-4">Create Category</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium fontColorGray ">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            required
            className="mt-1 p-2 border rounded w-full colorScheme"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium fontColorGray ">
            Description:
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            required
            className="mt-1 p-2 border rounded w-full colorScheme"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="show" className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show"
              checked={show}
              onChange={handleShowChange}
              className="h-4 w-4 text-blue-500 colorScheme"
            />
            <span className="text-sm font-medium fontColorGray">Show</span>
          </label>
        </div>
        <button disabled={creatingCategory} type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {creatingCategory ? 
            <div className='flex gap-4 '>
              <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Creating...</span>
              </div>
            </div>
        : "Create Category"}
        </button>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
