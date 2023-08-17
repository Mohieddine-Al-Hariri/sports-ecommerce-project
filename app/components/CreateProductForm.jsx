"use client"
import { useState } from 'react';
import Select from 'react-select';
import ReactMarkdown from 'react-markdown';
import { createProduct, publishImagesUrls, publishProduct } from '@/lib';
import { useRouter } from 'next/navigation';
import { v4 } from 'uuid';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from '@/lib/firebaseConfig';


const CreateProductForm = ({ categoriesData }) => {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    excerpt: '',
    description: '',
    collection: '',
    state: 'Available',
    categories: [],
  });
  const [price, setPrice] = useState(0);
  const [imageError, setImageError] = useState('');
  const router = useRouter();

  const handleImageUpload = (event) => {
    const newImages = Array.from(event.target.files);

    const invalidFiles = newImages.filter((file) => file.type.indexOf('image/') !== 0);

    if (invalidFiles.length > 0) {
      setImageError('Invalid file format. Please upload images only.');
      return;
    }

    setImageError('');
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const categoryOptions = categoriesData.map((category) => {
    return { value: category.id, label: category.name };
  })

  const handleCategoryChange = (selectedOptions) => {
    const selectedCategories = selectedOptions.map(option => option.value);
    setForm((prevForm) => ({ ...prevForm, categories: selectedCategories }));
  };

  async function uploadImage(image) {
    const storageRef = ref(storage, `/products/${form.name}/${Date.now()}-${image.name}`);
  
    const response = await uploadBytes(storageRef, image);
    const url = await getDownloadURL(response.ref);
    return url;
  }
  async function uploadImages() {
    const imagePromises = Array.from(images, (image) => uploadImage(image));
  
    const imageRes = await Promise.all(imagePromises);
    return imageRes; // list of url like ["https://..", ...]
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    const imgUrls = await uploadImages();
    const slug = v4();
    const createdProduct = await createProduct({...form, imgUrls, slug, price});
    await publishProduct(createdProduct.createProduct.id);
    await publishImagesUrls(createdProduct.createProduct.imageUrls);
    router.push(`/itemsDetails/${createdProduct.createProduct.id}`);
  };

  

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg fontColor overflow-y-scroll pb-16">
      <h2 className="text-3xl font-semibold mb-6">Create a Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <label htmlFor="images" className="block text-lg font-semibold mb-2">
            Images
          </label>
          <input
            type="file"
            id="images"
            required
            multiple
            onChange={handleImageUpload}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
          {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
          <div className="flex space-x-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Product ${index}`}
                  className="w-32 h-32 object-cover rounded"
                />
                <span
                  className="absolute top-0 right-0 text-white bg-red-500 rounded-full p-1 cursor-pointer"
                  onClick={() => handleRemoveImage(index)}
                >
                  X
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-lg font-semibold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-lg font-semibold mb-2">
            Excerpt
          </label>
          <input
            type="text"
            id="excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-lg font-semibold mb-2">
            Description (Markdown)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
            rows="6"
          />
          <ReactMarkdown className="prose mt-2">{form.description}</ReactMarkdown>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-lg font-semibold mb-2">
            Price
          </label>
          <div className="flex items-center border rounded focus-within:border-blue-500">
            <span className="text-gray-600 px-3">$</span>
            <input
              type="number"
              id="price"
              required
              name="price"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full py-2 px-2 rounded focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
          {/* {isNaN(parseFloat(form.price)) && form.price.trim() !== '' && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid price.</p>
          )} */}
        </div>
        <div className="mb-4">
          <label htmlFor="categories" className="block text-lg font-semibold mb-2">
            Categories
          </label>
          <Select
            id="categories"
            name="categories"
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter(option => form.categories.includes(option.value))}
            onChange={handleCategoryChange}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
          {/* <Select
            id="categories"
            name="categories"
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter(option => form.categories.includes(option.value))}
            onChange={handleCategoryChange}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          /> */}
        </div>
        <div className="mb-4">
          <label htmlFor="collection" className="block text-lg font-semibold mb-2">
            Collection
          </label>
          <select
            id="collection"
            name="collection"
            value={form.collection}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">Select a Collection</option>
            {/* Add collection options here */}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="state" className="block text-lg font-semibold mb-2">
            State
          </label>
          <select
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="Available">Available</option>
            <option value="Out Of Stock">Out Of Stock</option>
            <option value="Removed">Removed</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-500"
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProductForm;
