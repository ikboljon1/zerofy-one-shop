import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Products = () => {
  const isMobile = useIsMobile();
  
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
    <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
      <h3 className={`mb-4 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
        Top Products
      </h3>
      <div className="space-y-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`product-card ${
              isMobile ? 'p-3 space-x-3' : 'p-4 space-x-4'
            }`}
          >
            <img
              src={product.image}
              alt={product.name}
              className={`rounded-lg object-cover ${
                isMobile ? 'h-12 w-12' : 'h-16 w-16'
              }`}
            />
            <div>
              <h4 className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
                {product.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                Price: {product.price} руб
              </p>
              <p className="text-sm text-green-500">
                Profit: {product.profit} руб
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Products;