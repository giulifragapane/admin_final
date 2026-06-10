import { useNavigate, useParams } from "react-router-dom";
import { useProductDetail } from "@/features/catalog/products/hooks/useProductDetail";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useProductDetail(id);

  if (isLoading) return <p>Cargando producto...</p>;
  if (isError || !product) return <p>No se pudo cargar el producto.</p>;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Volver"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {product.categories.map((item) => (
            <span
              key={`detail-cat-${item.categoria.id}`}
              style={{ backgroundColor: item.categoria.color || "#E5E7EB" }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800"
            >
              {item.categoria.name}
              {item.es_principal ? " ★ principal" : ""}
            </span>
          ))}
        </div>

        <hr className="border-gray-100" />

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Descripción
          </span>
          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description || "Sin descripción"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Precio
            </span>
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toLocaleString("es-AR")}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Stock
            </span>
            <span className="text-sm text-gray-700">
              {product.stock} {product.unitMeasure?.abreviatura ?? "uds."}              
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Estado
            </span>
            <span
              className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${
                product.available
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.available ? "Disponible" : "No disponible"}
            </span>
          </div>

          {product.images?.[0] && (
            <div className="mb-6">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full max-h-64 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Ingredientes
          </span>

          <div className="flex flex-wrap gap-2">
            {product.ingredients.length > 0 ? (
              product.ingredients.map((item) => (
                <span
                  key={`detail-ing-${item.ingrediente.id}`}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.ingrediente.isAllergen
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.ingrediente.name}
                  {item.cantidad ? ` • ${item.cantidad}` : ""}
                  {item.unidad_medida ? ` ${item.unidad_medida.abreviatura}` : ""}
                  {item.ingrediente.isAllergen ? " • alérgeno" : ""}
                  {item.es_removible ? " • removible" : ""}                  
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Sin ingredientes</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};