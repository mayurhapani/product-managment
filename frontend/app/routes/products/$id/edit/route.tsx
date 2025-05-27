import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { productApi, categoryApi, materialApi } from '../../../../services/api';
import type { Product, Category, Material, Media } from '../../../../types/models';

type FormData = {
  product_name: string;
  SKU: string;
  category_id: string;
  price: string;
  status: 'active' | 'inactive';
  [key: string]: string | boolean;
};

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [mediaInputs, setMediaInputs] = useState<{ url: string }[]>([{ url: '' }]);
  
  // Load product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories and materials
        const [categoriesResponse, materialsResponse] = await Promise.all([
          categoryApi.getCategories(),
          materialApi.getMaterials()
        ]);
        
        setCategories(categoriesResponse.data);
        setMaterials(materialsResponse.data);
        
        // Fetch product if editing
        if (id && id !== 'new') {
          const productResponse = await productApi.getProductById(parseInt(id));
          const product = productResponse.data;
          
          // Set form values
          setValue('product_name', product.product_name);
          setValue('SKU', product.SKU);
          setValue('category_id', product.category_id.toString());
          setValue('price', product.price.toString());
          setValue('status', product.status);
          
          // Set material IDs
          if (product.material_ids && Array.isArray(product.material_ids)) {
            product.material_ids.forEach((matId: number) => {
              setValue(`material_${matId}`, true);
            });
          }
          
          // Set media inputs
          if (product.media && Array.isArray(product.media) && product.media.every((m) => typeof m !== 'string')) {
            setMediaInputs(product.media.map((m: Media) => ({ url: m.url })));
          }
        }
        
        setLoading(false);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, setValue]);
  
  // Add more media input fields
  const addMediaInput = () => {
    setMediaInputs([...mediaInputs, { url: '' }]);
  };
  
  // Remove media input field
  const removeMediaInput = (index: number) => {
    const newInputs = [...mediaInputs];
    newInputs.splice(index, 1);
    setMediaInputs(newInputs);
  };
  
  // Handle media input change
  const handleMediaChange = (index: number, value: string) => {
    const newInputs = [...mediaInputs];
    newInputs[index].url = value;
    setMediaInputs(newInputs);
  };
  
  // Form submission handler
  const onSubmit = async (data: FormData) => {
    try {
      // Extract selected material IDs
      const materialIds = materials
        .filter(mat => data[`material_${mat.material_id}`])
        .map(mat => mat.material_id);
      
      // Prepare form data
      const formData: Partial<Product> = {
        product_name: data.product_name,
        SKU: data.SKU,
        category_id: parseInt(data.category_id),
        material_ids: materialIds,
        price: parseFloat(data.price),
        status: data.status
      };
      
      // Add media URLs separately (not as Media objects since API expects string[])
      const mediaUrls = mediaInputs
        .filter(m => m.url.trim() !== '')
        .map(m => m.url);
      
      // Create or update product
      if (id && id !== 'new') {
        await productApi.updateProduct(parseInt(id), { ...formData, media: mediaUrls });
      } else {
        await productApi.createProduct({ ...formData, media: mediaUrls });
      }
      
      // Redirect to products list
      navigate('/products');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };
  
  if (loading) return <div className="text-center p-4">Loading...</div>;
  
  return (
    <div className="container mx-auto p-4 max-w-4xl text-gray-200 font-sans">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {id && id !== 'new' ? 'Edit Product' : 'Add New Product'}
        </h1>
        <Link to="/" className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
          Back to List
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Product Name*
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline ${errors.product_name ? 'border-red-500' : ''}`}
              type="text"
              {...register('product_name', { required: 'Product name is required' })}
            />
            {errors.product_name && (
              <p className="text-red-500 text-xs italic">{errors.product_name.message as string}</p>
            )}
          </div>
          
          {/* SKU */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              SKU*
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline ${errors.SKU ? 'border-red-500' : ''}`}
              type="text"
              {...register('SKU', { required: 'SKU is required' })}
            />
            {errors.SKU && (
              <p className="text-red-500 text-xs italic">{errors.SKU.message as string}</p>
            )}
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Category*
            </label>
            <select
              className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.category_id ? 'border-red-500' : ''}`}
              {...register('category_id', { required: 'Category is required' })}
            >
              <option value="" className="bg-gray-700 text-white">Select Category</option>
              {categories.map((category: Category) => (
                <option key={category.category_id} value={category.category_id} className="bg-gray-700 text-white">
                  {category.category_name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-xs italic">{errors.category_id.message as string}</p>
            )}
          </div>
          
          {/* Price */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Price*
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline ${errors.price ? 'border-red-500' : ''}`}
              type="number"
              step="0.01"
              min="0"
              {...register('price', { required: 'Price is required' })}
            />
            {errors.price && (
              <p className="text-red-500 text-xs italic">{errors.price.message as string}</p>
            )}
          </div>
          
          {/* Status */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Status
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline"
              {...register('status')}
            >
              <option value="active" className="bg-gray-700 text-white">Active</option>
              <option value="inactive" className="bg-gray-700 text-white">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Materials */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Materials*
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {materials.map((material: Material) => (
              <div key={material.material_id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`material_${material.material_id}`}
                  className="mr-2"
                  {...register(`material_${material.material_id}` as const)}
                />
                <label htmlFor={`material_${material.material_id}`}>
                  {material.material_name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Media URLs */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2">
            Media URLs
          </label>
          {mediaInputs.map((input, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={input.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMediaChange(index, e.target.value)}
                placeholder="Enter media URL"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline mr-2"
              />
              <button
                type="button"
                onClick={() => removeMediaInput(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMediaInput}
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mt-2"
          >
            Add Media URL
          </button>
        </div>
        
        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {id && id !== 'new' ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
} 