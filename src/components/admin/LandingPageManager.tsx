
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Edit, Eye, Trash2, Image, Save, Layout, CheckCircle, XCircle } from "lucide-react";

type SectionType = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
};

type HeroImage = {
  id: string;
  url: string;
  alt: string;
  isActive: boolean;
};

const LandingPageManager = () => {
  const [sections, setSections] = useState<SectionType[]>([
    { id: "1", title: "Главный заголовок", content: "Управляйте своими продажами с нашей платформой", isActive: true, order: 1 },
    { id: "2", title: "О нас", content: "Мы помогаем продавцам оптимизировать бизнес-процессы", isActive: true, order: 2 },
    { id: "3", title: "Преимущества", content: "Аналитика, интеграции, поддержка 24/7", isActive: true, order: 3 },
    { id: "4", title: "Тарифы", content: "Выберите подходящий тариф для вашего бизнеса", isActive: true, order: 4 },
    { id: "5", title: "Отзывы", content: "Отзывы наших клиентов о работе с платформой", isActive: false, order: 5 },
  ]);
  
  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { id: "1", url: "/lovable-uploads/0a0d0dd7-b54d-4163-ba50-1ddbb5b6dd7d.png", alt: "Главное изображение 1", isActive: true },
    { id: "2", url: "/lovable-uploads/4ea57e12-c728-4a2d-96bd-041c251862ec.png", alt: "Главное изображение 2", isActive: false },
    { id: "3", url: "/lovable-uploads/9f6e8e49-868a-45c9-a6e7-9c8878a3e760.png", alt: "Главное изображение 3", isActive: false },
  ]);
  
  const [currentSection, setCurrentSection] = useState<SectionType | null>(null);
  const [currentImage, setCurrentImage] = useState<HeroImage | null>(null);
  const [isLandingActive, setIsLandingActive] = useState(true);
  const { toast } = useToast();

  const handleSaveSection = (section: SectionType) => {
    if (currentSection) {
      // Обновление существующей секции
      setSections(sections.map(s => s.id === section.id ? section : s));
    } else {
      // Добавление новой секции
      const newSection = {
        ...section,
        id: Date.now().toString(),
        order: sections.length + 1
      };
      setSections([...sections, newSection]);
    }
    
    toast({
      title: "Успешно",
      description: `Секция ${currentSection ? "обновлена" : "добавлена"}`,
    });
    
    setCurrentSection(null);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
    toast({
      title: "Удалено",
      description: "Секция удалена с главной страницы",
    });
  };

  const handleSaveImage = (image: HeroImage) => {
    if (currentImage) {
      // Обновление существующего изображения
      setHeroImages(heroImages.map(img => img.id === image.id ? image : img));
    } else {
      // Добавление нового изображения
      const newImage = {
        ...image,
        id: Date.now().toString()
      };
      setHeroImages([...heroImages, newImage]);
    }
    
    toast({
      title: "Успешно",
      description: `Изображение ${currentImage ? "обновлено" : "добавлено"}`,
    });
    
    setCurrentImage(null);
  };

  const handleDeleteImage = (id: string) => {
    setHeroImages(heroImages.filter(image => image.id !== id));
    toast({
      title: "Удалено",
      description: "Изображение удалено с главной страницы",
    });
  };

  const handleSetActiveImage = (id: string) => {
    setHeroImages(heroImages.map(image => ({
      ...image,
      isActive: image.id === id
    })));
    
    toast({
      title: "Изменено",
      description: "Активное изображение изменено",
    });
  };

  const handleToggleSectionActive = (id: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isActive: !section.isActive } : section
    ));
  };

  const handleLandingActiveToggle = () => {
    setIsLandingActive(!isLandingActive);
    toast({
      title: "Статус лендинга изменен",
      description: `Лендинг ${!isLandingActive ? "активирован" : "деактивирован"}`,
    });
  };

  const handlePublishChanges = () => {
    toast({
      title: "Изменения опубликованы",
      description: "Обновления лендинга успешно опубликованы",
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Управление лендингом</CardTitle>
            <CardDescription>Настройте содержимое главной страницы</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="landing-active"
                checked={isLandingActive}
                onCheckedChange={handleLandingActiveToggle}
              />
              <Label htmlFor="landing-active">Лендинг активен</Label>
            </div>
            <Button onClick={handlePublishChanges}>
              <Save className="h-4 w-4 mr-2" />
              Опубликовать изменения
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sections">
          <TabsList className="mb-4">
            <TabsTrigger value="sections">
              <Layout className="h-4 w-4 mr-2" />
              Секции
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="h-4 w-4 mr-2" />
              Изображения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <div className="mb-4 flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setCurrentSection(null)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Добавить секцию
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить новую секцию</DialogTitle>
                    <DialogDescription>
                      Создайте новую секцию для лендинга
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="section-title" className="text-right">Заголовок</Label>
                      <Input
                        id="section-title"
                        className="col-span-3"
                        placeholder="Введите заголовок секции"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="section-content" className="text-right">Содержимое</Label>
                      <Textarea
                        id="section-content"
                        className="col-span-3"
                        placeholder="Введите содержимое секции"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="section-active" className="text-right">Активна</Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Switch id="section-active" defaultChecked />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Сохранить секцию</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Порядок</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Содержимое</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">{section.order}</TableCell>
                      <TableCell>{section.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{section.content}</TableCell>
                      <TableCell>
                        <div 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            section.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {section.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Активна
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Неактивна
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleSectionActive(section.id)}>
                          {section.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(section.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="mb-4 flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setCurrentImage(null)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Добавить изображение
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить изображение</DialogTitle>
                    <DialogDescription>
                      Добавьте новое изображение для баннера
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-url" className="text-right">URL</Label>
                      <Input
                        id="image-url"
                        className="col-span-3"
                        placeholder="Введите URL изображения"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-alt" className="text-right">Alt текст</Label>
                      <Input
                        id="image-alt"
                        className="col-span-3"
                        placeholder="Введите alt текст"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image-active" className="text-right">Активно</Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Switch id="image-active" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Сохранить изображение</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Изображение</TableHead>
                    <TableHead>Alt текст</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heroImages.map((image) => (
                    <TableRow key={image.id}>
                      <TableCell>
                        <div className="h-16 w-24 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={image.url} 
                            alt={image.alt} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{image.alt}</TableCell>
                      <TableCell>
                        <div 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            image.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {image.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Активно
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Неактивно
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {!image.isActive && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSetActiveImage(image.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Предварительный просмотр</Button>
        <Button onClick={handlePublishChanges}>
          <Save className="h-4 w-4 mr-2" />
          Опубликовать изменения
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LandingPageManager;
