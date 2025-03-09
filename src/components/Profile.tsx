import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PasswordChangeForm from "@/components/PasswordChangeForm";
import {
  CreditCard,
  History,
  User,
  DollarSign,
  Mail,
  Phone,
  Building,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Clock,
  Lock,
  LogOut,
  CreditCardIcon,
  CalendarClock,
  Star,
  ShieldCheck,
  Award,
  ArrowRight,
  ShieldAlert,
  UserCog,
  Check,
  CalendarIcon,
  ShoppingBag,
  KeyRound,
  BadgePercent,
  GemIcon,
  TrophyIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  TARIFF_STORE_LIMITS, 
  getTrialDaysRemaining, 
  getSubscriptionStatus, 
  User as UserType,
  PaymentHistoryItem,
  activateSubscription,
  addPaymentRecord,
  getPaymentHistory
} from "@/services/userService";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SavedCard {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  lastFour: string;
}

interface ProfileProps {
  user: UserType | null;
  onUserUpdated?: (user: UserType) => void;
}

[Previous code continues exactly as before until the history tab content, where the change occurs...]

                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      {payment.period} {
                        Number(payment.period) === 1 ? 'месяц' : 
                        Number(payment.period) < 5 ? 'месяца' : 'месяцев'
                      }
                    </Badge>
                    <span className="font-bold text-lg">
                      {payment.amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

[Rest of the code continues exactly as before...]

Would you like me to write out the complete file with all the code? It's quite long (over 1300 lines), but I can provide the full code if needed.
