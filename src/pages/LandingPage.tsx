import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronsUpDown,
  Download,
  Package2,
  Plus,
  Upload,
  Zap,
} from "lucide-react"

const LandingPage = () => {
  return (
    <div className="container mx-auto py-10">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome to Lovable Landing Page
        </h1>
        <p className="text-muted-foreground text-center">
          Explore the amazing features and integrations.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Track your store's performance with real-time analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450 Sales</div>
            <p className="text-sm text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>
              Manage your products and stock levels efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,200 Products</div>
            <p className="text-sm text-muted-foreground">
              Low stock alerts enabled
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Customer Support</CardTitle>
            <CardDescription>
              Provide excellent support with our integrated tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">350 Open Tickets</div>
            <p className="text-sm text-muted-foreground">
              Average response time: 2 hours
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Real-Time Analytics <Zap className="ml-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                Get instant insights into your store's performance with our
                real-time analytics dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Inventory Management <Package2 className="ml-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                Easily manage your products, track stock levels, and receive low
                stock alerts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Customer Support Tools <Plus className="ml-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                Provide excellent customer support with our integrated ticketing
                system and live chat.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
  <img 
    src="/lovable-uploads/fa3c44de-7a78-4b18-b747-af93609082ff.png" 
    alt="Warehouse distribution dashboard" 
    className="w-full h-auto rounded-lg shadow-md"
  />
</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Table Example</h2>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV003</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Direct Transfer</TableCell>
              <TableCell className="text-right">$300.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">$700.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">File Upload & Download</h2>
        <div className="flex items-center space-x-4">
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Form</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input type="text" id="name" placeholder="Your Name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="Your Email" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="message">Message</Label>
            <Input type="text" id="message" placeholder="Your Message" />
          </div>
          <div className="md:col-span-2">
            <Button className="w-full">Submit</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
