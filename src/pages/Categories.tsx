import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../lib/api";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import type { CreateCategoryRequest } from "../types";

export const Categories: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryRequest>();

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateCategoryRequest>;
    }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateCategoryRequest) => {
    const formData = new FormData();
    
    // Add form fields
    Object.keys(data).forEach(key => {
      if (data[key as keyof CreateCategoryRequest] !== undefined) {
        formData.append(key, data[key as keyof CreateCategoryRequest] as string);
      }
    });
    
    // Add image file if selected
    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setImagePreview(category.image || '');
    setImageFile(null);
    reset({
      name: category.name,
      description: category.description,
      image: category.image,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview('');
    setEditingCategory(null);
    reset();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setImageFile(null);
            setImagePreview('');
            reset();
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="flex space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-full h-32 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : (
          categories?.data.data?.map((category) => (
          <div key={category.id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {category.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
            )}

            {category.description && (
              <p className="text-sm text-gray-600 mb-4">
                {category.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{category._count?.products || 0} products</span>
              <span>{new Date(category.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={handleModalClose}
            />
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="input mt-1"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    className="input mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* File Upload */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 border border-blue-200">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      <span className="text-sm text-gray-500">or</span>
                    </div>
                    
                    {/* URL Input */}
                    <div>
                      <input
                        {...register('image')}
                        placeholder="Enter image URL"
                        className="input"
                        onChange={(e) => {
                          if (e.target.value && !imageFile) {
                            setImagePreview(e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
