export const ProductSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-64 bg-gray-300"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-300 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-28"></div>
      </div>
    </div>
  </div>
);

export const OrderSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-300 rounded w-32"></div>
      <div className="h-6 bg-gray-300 rounded w-20"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
    <div className="border-t mt-3 pt-3">
      <div className="h-6 bg-gray-300 rounded w-24 ml-auto"></div>
    </div>
  </div>
);