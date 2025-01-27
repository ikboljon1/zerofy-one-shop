import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown } from "lucide-react";

const Products = () => {
  const isMobile = useIsMobile();
  
  const profitableProducts = [
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
    {
      id: 3,
      name: "Product 3",
      price: "100.00",
      profit: "+600",
      image: "https://storage.googleapis.com/a1aa/image/V_oH1FpXQ-d39qZ7p0616Z6B96t36e8_j9mY2o6bYf4.jpg",
    }
  ];

  const unprofitableProducts = [
    {
      id: 4,
      name: "Product 4",
      price: "50.00",
      profit: "-100",
      image: "https://storage.googleapis.com/a1aa/image/my0fEY85HYuLg3vmLWQ7I2YlcNwV-1_czuBb_gBaqXg.jpg",
    },
    {
      id: 5,
      name: "Product 5",
      price: "70.00",
      profit: "-200",
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg",
    },
    {
      id: 6,
      name: "Product 6",
      price: "80.00",
      profit: "-300",
      image: "https://storage.googleapis.com/a1aa/image/eArx1s4nK4iQEkvJiT5TlQGA9-lquenGu58uX_Euvmg.jpg",
    }
  ];

  const ProductList = ({ products, isProfitable }: { products: typeof profitableProducts, isProfitable: boolean }) => (
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
              Цена: {product.price} руб
            </p>
            <p className={`text-sm flex items-center ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? 'Прибыль: ' : 'Убыток: '}{product.profit} руб
              {isProfitable ? (
                <ArrowUp className="h-4 w-4 ml-1" />
              ) : (
                <ArrowDown className="h-4 w-4 ml-1" />
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2'}`}>
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`mb-4 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
          Топ-3 прибыльных товара
        </h3>
        <ProductList products={profitableProducts} isProfitable={true} />
      </Card>
      
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`mb-4 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
          Топ-3 убыточных товара
        </h3>
        <ProductList products={unprofitableProducts} isProfitable={false} />
      </Card>
    </div>
  );
};

export default Products;