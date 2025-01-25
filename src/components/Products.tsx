import { Card } from "@/components/ui/card";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Product 1",
      price: "150.00",
      profit: "+1000",
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg",
    },
    {
      id: 2,
      name: "Product 2",
      price: "200.00",
      profit: "+800",
      image: "https://storage.googleapis.com/a1aa/image/2-I48jS05G1pZcE4fK36Qp-l_hW543l6F2bV_X32lK0.jpg",
    },
  ];

  return (
    <Card className="mt-6 p-4">
      <h3 className="mb-4 text-lg font-semibold">Top Products</h3>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-muted-foreground">
                Price: {product.price} руб
              </p>
              <p className="text-sm text-green-500">Profit: {product.profit} руб</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Products;