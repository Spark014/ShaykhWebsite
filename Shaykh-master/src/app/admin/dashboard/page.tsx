"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { LayoutDashboard, LogOut, Loader2, MessageSquareText, Users, Settings, Package, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resourceCounts, setResourceCounts] = useState({
    total: 0,
    collections: 0,
    questions: 0,
    loading: true
  });

  useEffect(() => {
    const storedLang = (localStorage.getItem('language') as 'en' | 'ar') || 'en';
    setCurrentLanguage(storedLang);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'language' && event.newValue && (event.newValue === 'en' || event.newValue === 'ar')) {
        setCurrentLanguage(event.newValue as 'en' | 'ar');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin/login');
    }
  }, [authLoading, user, router]);

  const fetchCounts = useCallback(async () => {
    if (!user || !supabase) return;
    
    try {
      setResourceCounts(prev => ({ ...prev, loading: true }));
      
      const [resourcesResult, collectionsResult, questionsResult] = await Promise.all([
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('collections').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id').eq('status', 'pending')
      ]);

      console.log('Questions query result:', questionsResult); // Debug log

      setResourceCounts({
        total: resourcesResult.count || 0,
        collections: collectionsResult.count || 0,
        questions: Array.isArray(questionsResult.data) ? questionsResult.data.length : 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
      setResourceCounts(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCounts();
    }
  }, [user, fetchCounts]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // Redirection will be handled by the AuthContext effect or the useEffect above
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show a toast message for logout error
    } finally {
      setIsLoggingOut(false);
    }
  };

  const T = useMemo(() => ({ // Wrapped in useMemo
    en: {
      title: "Admin Dashboard",
      description: "Manage scholarly resources, users, and site settings.",
      welcomeMessage: "Welcome to the Admin Dashboard.",
      resourceManagement: "Resource Management",
      resourceManagementDesc: "Manage all site resources (PDFs, audio, etc.).",
      resourceCount: (count: number) => `${count} resources`,
      collectionManagement: "Collection Management",
      collectionManagementDesc: "Organize resources into collections.",
      collectionCount: (count: number) => `${count} collections`,
      userManagement: "User Management",
      userManagementDesc: "Manage admin users and roles.",
      questionsManagement: "Questions Management",
      questionsManagementDesc: "Review and answer submitted questions.",
      questionCount: (count: number) => `${count} questions`,
      siteSettings: "Site Settings",
      siteSettingsDesc: "Configure general website settings.",
      logoutButton: "Logout",
      loggingOutButton: "Logging out...",
    },
    ar: {
      title: "لوحة تحكم المسؤول",
      description: "إدارة الموارد العلمية والمستخدمين وإعدادات الموقع.",
      welcomeMessage: "مرحباً بك في لوحة تحكم المسؤول.",
      resourceManagement: "إدارة الموارد",
      resourceManagementDesc: "إدارة جميع موارد الموقع (PDF، صوتيات، إلخ).",
      resourceCount: (count: number) => `${count} مورد`,
      collectionManagement: "إدارة المجموعات",
      collectionManagementDesc: "تنظيم الموارد في مجموعات.",
      collectionCount: (count: number) => `${count} مجموعة`,
      userManagement: "إدارة المستخدمين",
      userManagementDesc: "إدارة المستخدمين المسؤولين والأدوار.",
      questionsManagement: "إدارة الأسئلة",
      questionsManagementDesc: "مراجعة الأسئلة المرسلة والإجابة عليها.",
      questionCount: (count: number) => `${count} سؤال`,
      siteSettings: "إعدادات الموقع",
      siteSettingsDesc: "تكوين إعدادات الموقع العامة.",
      logoutButton: "تسجيل الخروج",
      loggingOutButton: "جارٍ تسجيل الخروج...",
    }
  }[currentLanguage]), [currentLanguage]);


  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If execution reaches here, user is authenticated and authLoading is false.
  return (
    <div className="container mx-auto py-8 space-y-8" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <header className="text-center">
        <LayoutDashboard className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline">
          {T.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {T.description}
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">{T.welcomeMessage}</CardTitle>
          <CardDescription>Logged in as: {user.email}</CardDescription> {/* Use user from AuthContext */}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/resources" passHref>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{T.resourceManagement}</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-1">
                  {resourceCounts.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    T.resourceCount(resourceCounts.total)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{T.resourceManagementDesc}</p>
              </CardContent>
            </Card>
          </Link>
           <Link href="/admin/manage-collections" passHref>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{T.collectionManagement}</CardTitle>
                <Library className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-1">
                  {resourceCounts.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    T.collectionCount(resourceCounts.collections)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{T.collectionManagementDesc}</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/questions-management" passHref>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{T.questionsManagement}</CardTitle>
                <MessageSquareText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-1">
                  {resourceCounts.loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    T.questionCount(resourceCounts.questions)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{T.questionsManagementDesc}</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/site-settings" passHref>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{T.siteSettings}</CardTitle>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{T.siteSettingsDesc}</p>
              </CardContent>
            </Card>
          </Link>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center">
        <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut} className="w-full sm:w-auto">
          {isLoggingOut ? (
            <Loader2 className={`${currentLanguage === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} />
          ) : (
            <LogOut className={`${currentLanguage === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          )}
          {isLoggingOut ? T.loggingOutButton : T.logoutButton}
        </Button>
      </div>
    </div>
  );
}
