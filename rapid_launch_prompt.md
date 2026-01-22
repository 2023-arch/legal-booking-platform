# RAPID COMMERCIAL LAUNCH - COMPLETE MISSING FEATURES

## PROJECT STATUS & GOAL

**Current State:** Homepage is excellent (9.1/10). SEO fixed. Design professional.

**Goal:** Complete ALL missing features for immediate commercial launch within 48-72 hours.

**What's Missing:** Search page, authentication pages, booking flow, lawyer profiles, user dashboards, and backend API integration.

**Your Task:** Build all missing pages and features to make this a fully functional, production-ready platform that can accept real users and process real bookings TODAY.

---

## 🔴 PHASE 1: CRITICAL PAGES (Build First - 6 hours)

### 1. COMPLETE SEARCH PAGE WITH FILTERS

**File:** `/app/search/page.tsx`

**Requirements:**
- Full-screen layout with sidebar filters (1/4 width) and results (3/4 width)
- Real-time filtering without page reload
- Connects to backend API: `GET /api/v1/lawyers/search`
- Responsive: Filters in drawer on mobile
- Loading skeletons while fetching
- Empty state when no results
- Pagination (20 lawyers per page)

```typescript
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Languages, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, total_pages: 1 });
  
  // Location states
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [courts, setCourts] = useState([]);
  
  // Specialization states
  const [specializations, setSpecializations] = useState([]);
  const [subSpecializations, setSubSpecializations] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    state_id: searchParams.get('state_id') || '',
    district_id: searchParams.get('district_id') || '',
    court_id: searchParams.get('court_id') || '',
    specialization_id: searchParams.get('specialization_id') || '',
    sub_specialization_id: searchParams.get('sub_specialization_id') || '',
    min_price: parseInt(searchParams.get('min_price') || '500'),
    max_price: parseInt(searchParams.get('max_price') || '10000'),
    min_experience: searchParams.get('min_experience') || '',
    min_rating: searchParams.get('min_rating') || '',
    languages: searchParams.get('languages') || '',
    sort_by: searchParams.get('sort_by') || 'rating_desc',
    page: parseInt(searchParams.get('page') || '1'),
  });

  // Fetch initial data
  useEffect(() => {
    fetchStates();
    fetchSpecializations();
  }, []);

  // Fetch states
  const fetchStates = async () => {
    try {
      const { data } = await api.get('/locations/states');
      setStates(data.data || []);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  // Fetch districts when state changes
  useEffect(() => {
    if (filters.state_id) {
      fetchDistricts(filters.state_id);
      setFilters(prev => ({ ...prev, district_id: '', court_id: '' }));
    }
  }, [filters.state_id]);

  const fetchDistricts = async (stateId: string) => {
    try {
      const { data } = await api.get(`/locations/states/${stateId}/districts`);
      setDistricts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  // Fetch courts when district changes
  useEffect(() => {
    if (filters.district_id) {
      fetchCourts(filters.district_id);
      setFilters(prev => ({ ...prev, court_id: '' }));
    }
  }, [filters.district_id]);

  const fetchCourts = async (districtId: string) => {
    try {
      const { data } = await api.get(`/locations/districts/${districtId}/courts`);
      setCourts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch courts:', error);
    }
  };

  // Fetch specializations
  const fetchSpecializations = async () => {
    try {
      const { data } = await api.get('/locations/specializations');
      setSpecializations(data.data || []);
    } catch (error) {
      console.error('Failed to fetch specializations:', error);
    }
  };

  // Fetch sub-specializations when main specialization changes
  useEffect(() => {
    if (filters.specialization_id) {
      const selected = specializations.find((s: any) => s.id === filters.specialization_id);
      setSubSpecializations(selected?.sub_specializations || []);
      setFilters(prev => ({ ...prev, sub_specialization_id: '' }));
    }
  }, [filters.specialization_id, specializations]);

  // Fetch lawyers whenever filters change
  useEffect(() => {
    fetchLawyers();
  }, [filters]);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const params: any = { ...filters };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) delete params[key];
      });

      const { data } = await api.get('/lawyers/search', { params });
      setLawyers(data.data.lawyers || []);
      setPagination(data.data.pagination || { total: 0, page: 1, total_pages: 1 });
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: any) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== '' && value !== null) params.set(key, String(value));
    });
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({
      state_id: '', district_id: '', court_id: '',
      specialization_id: '', sub_specialization_id: '',
      min_price: 500, max_price: 10000,
      min_experience: '', min_rating: '', languages: '',
      sort_by: 'rating_desc', page: 1,
    });
    setDistricts([]);
    setCourts([]);
    setSubSpecializations([]);
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - same as homepage */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">LegalBook</Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login"><Button variant="outline">Log In</Button></Link>
            <Link href="/auth/register"><Button>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Find a Lawyer</h1>
          <p className="text-gray-600">Search from {pagination.total || 0} verified lawyers across India</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-lg">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
              </div>

              <div className="space-y-6">
                {/* Location Filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Select value={filters.state_id} onValueChange={(val) => updateFilters({ state_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state: any) => (
                        <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.state_id && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">District</label>
                    <Select value={filters.district_id} onValueChange={(val) => updateFilters({ district_id: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district: any) => (
                          <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filters.district_id && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Court</label>
                    <Select value={filters.court_id} onValueChange={(val) => updateFilters({ court_id: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select court" />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((court: any) => (
                          <SelectItem key={court.id} value={court.id}>{court.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Specialization Filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Specialization</label>
                  <Select value={filters.specialization_id} onValueChange={(val) => updateFilters({ specialization_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec: any) => (
                        <SelectItem key={spec.id} value={spec.id}>{spec.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {filters.specialization_id && subSpecializations.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sub-specialization</label>
                    <Select value={filters.sub_specialization_id} onValueChange={(val) => updateFilters({ sub_specialization_id: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {subSpecializations.map((sub: any) => (
                          <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-4 block">
                    Price Range: ₹{filters.min_price} - ₹{filters.max_price}
                  </label>
                  <Slider
                    value={[filters.min_price, filters.max_price]}
                    onValueChange={([min, max]) => updateFilters({ min_price: min, max_price: max })}
                    min={500}
                    max={10000}
                    step={500}
                    className="mb-2"
                  />
                </div>

                {/* Experience Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Experience</label>
                  <Select value={filters.min_experience} onValueChange={(val) => updateFilters({ min_experience: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any experience</SelectItem>
                      <SelectItem value="5">5+ years</SelectItem>
                      <SelectItem value="10">10+ years</SelectItem>
                      <SelectItem value="15">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <Select value={filters.min_rating} onValueChange={(val) => updateFilters({ min_rating: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rating</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {loading ? 'Searching...' : `${pagination.total || 0} lawyers found`}
              </p>
              <Select value={filters.sort_by} onValueChange={(val) => updateFilters({ sort_by: val })}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="experience_desc">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="flex gap-4">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : lawyers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No lawyers found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search in a different location</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {lawyers.map((lawyer: any) => (
                    <Link key={lawyer.id} href={`/lawyers/${lawyer.id}`}>
                      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex gap-6">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={lawyer.profile_photo_url} />
                            <AvatarFallback className="text-xl">{lawyer.name[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-xl font-semibold">{lawyer.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(lawyer.average_rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {lawyer.average_rating.toFixed(1)} ({lawyer.total_reviews} reviews)
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">₹{lawyer.consultation_fee}</div>
                                <div className="text-sm text-gray-500">per consultation</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {lawyer.specializations?.slice(0, 3).map((spec: any, idx: number) => (
                                <Badge key={idx} variant="secondary">{spec.name}</Badge>
                              ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                <span>{lawyer.years_experience} years exp.</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Languages className="h-4 w-4" />
                                <span>{lawyer.languages?.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{lawyer.courts?.length || 0} courts</span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="h-6 w-6 text-gray-400 self-center" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => updateFilters({ page: filters.page - 1 })}
                    >
                      Previous
                    </Button>

                    {[...Array(Math.min(pagination.total_pages, 5))].map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === filters.page ? 'default' : 'outline'}
                          onClick={() => updateFilters({ page })}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      disabled={filters.page === pagination.total_pages}
                      onClick={() => updateFilters({ page: filters.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>}>
      <SearchPageContent />
    </Suspense>
  );
}
```

---

### 2. AUTHENTICATION PAGES

Create these files exactly as shown:

**File:** `/app/auth/login/page.tsx` - COMPLETE LOGIN PAGE
**File:** `/app/auth/register/page.tsx` - COMPLETE REGISTRATION WITH OTP
**File:** `/app/auth/lawyer-register/page.tsx` - MULTI-STEP LAWYER REGISTRATION

**Use the code I provided in the previous "Production Launch Ready" prompt - copy exactly from there.**

---

### 3. LAWYER PROFILE PAGE

**File:** `/app/lawyers/[id]/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Briefcase, Languages, Award, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LawyerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lawyer, setLawyer] = useState<any>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchLawyer(params.id as string);
      fetchReviews(params.id as string);
    }
  }, [params.id]);

  const fetchLawyer = async (id: string) => {
    try {
      const { data } = await api.get(`/lawyers/${id}`);
      setLawyer(data.data);
    } catch (error) {
      console.error('Failed to fetch lawyer:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      const { data } = await api.get(`/lawyers/${id}/reviews`);
      setReviews(data.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleBookConsultation = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/booking/create?lawyer_id=${params.id}`);
    } else {
      router.push(`/booking/create?lawyer_id=${params.id}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!lawyer) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Lawyer not found</h2>
        <Link href="/search"><Button>Back to Search</Button></Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">LegalBook</Link>
          <Link href="/search"><Button variant="outline">Back to Search</Button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={lawyer.profile_photo_url} />
              <AvatarFallback className="text-4xl bg-white text-blue-600">{lawyer.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{lawyer.name}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {lawyer.specializations?.map((spec: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="bg-white text-blue-600">
                    {spec.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 text-white/90 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{lawyer.average_rating.toFixed(1)}</span>
                  <span>({lawyer.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span>{lawyer.years_experience} years experience</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {lawyer.languages?.map((lang: string, idx: number) => (
                  <span key={idx} className="text-sm">{lang}</span>
                ))}
              </div>
            </div>

            <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">₹{lawyer.consultation_fee}</div>
                <div className="text-sm text-gray-600">per consultation</div>
              </div>
              <Button onClick={handleBookConsultation} className="w-full" size="lg">
                Book Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="courts">Courts</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{lawyer.bio || 'No bio available'}</p>
              </div>

              {lawyer.education && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Education</h2>
                  <p className="text-gray-700">{lawyer.education}</p>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-3">Bar Council Registration</h2>
                <p className="text-gray-700">
                  Registration No: {lawyer.bar_council_number.slice(0, 3)}***{lawyer.bar_council_number.slice(-3)}
                </p>
                <p className="text-sm text-green-600 mt-1">✓ Verified by LegalBook</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {lawyer.specializations?.map((spec: any, idx: number) => (
                    <Badge key={idx} variant="outline">{spec.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Client Reviews</h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">{review.user_name}</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="courts" className="mt-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Practicing Courts</h2>
              <div className="grid gap-3">
                {lawyer.courts?.map((court: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{court.name}</div>
                      <div className="text-sm text-gray-600">{court.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

---

## 🟡 PHASE 2: BOOKING SYSTEM (Build Second - 4 hours)

### 4. BOOKING CREATION FLOW

**File:** `/app/booking/create/page.tsx`

This must:
1. Get lawyer_id from URL params
2. Show lawyer info at top
3. Step 1: User writes 200-char case description
4. Call API to generate AI summary
5. Step 2: Show original + AI summary, allow regenerate
6. Step 3: Integrate Razorpay payment
7. After payment: Redirect to booking details

```typescript
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function BookingCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lawyer_id = searchParams.get('lawyer_id');

  const [step, setStep] = useState(1);
  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [caseDescription, setCaseDescription] = useState('');
  const [courtId, setCourtId] = useState('');
  const [policeStationId, setPoliceStationId] = useState('');
  const [locationType, setLocationType] = useState<'court' | 'police_station'>('court');

  // Draft data
  const [draftId, setDraftId] = useState('');
  const [aiSummary, setAiSummary] = useState('');

  // Location data
  const [courts, setCourts] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push(`/auth/login?redirect=/booking/create?lawyer_id=${lawyer_id}`);
      return;
    }
    if (lawyer_id) {
      fetchLawyer(lawyer_id);
    }
  }, [user, lawyer_id]);

  const fetchLawyer = async (id: string) => {
    try {
      const { data } = await api.get(`/lawyers/${id}`);
      setLawyer(data.data);
      // Get courts for this lawyer
      if (data.data.courts?.length > 0) {
        setCourts(data.data.courts);
      }
    } catch (error) {
      setError('Failed to load lawyer details');
    }
  };

  const handleStep1Submit = async () => {
    if (caseDescription.length < 10 || caseDescription.length > 200) {
      setError('Description must be between 10-200 characters');
      return;
    }

    if (!courtId && !policeStationId) {
      setError('Please select a court or police station');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/bookings/create', {
        lawyer_id,
        case_description: caseDescription,
        court_id: locationType === 'court' ? courtId : undefined,
        police_station_id: locationType === 'police_station' ? policeStationId : undefined,
      });

      setDraftId(data.data.booking_draft_id);
      setAiSummary(data.data.ai_summary);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/bookings/regenerate-summary', {
        booking_draft_id: draftId,
        updated_description: caseDescription,
      });
      setAiSummary(data.data.ai_summary);
    } catch (err: any) {
      setError('Failed to regenerate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndPay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/bookings/confirm', {
        booking_draft_id: draftId,
      });

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.data.amount,
        currency: data.data.currency,
        order_id: data.data.razorpay_order_id,
        name: 'LegalBook',
        description: `Consultation with ${lawyer.name}`,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/dashboard/bookings/${data.data.booking_id}`);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!lawyer) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href={`/lawyers/${lawyer_id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`h-1 w-24 mx-2 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Lawyer Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={lawyer.profile_photo_url} />
              <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{lawyer.name}</h2>
              <p className="text-gray-600">{lawyer.specializations?.[0]?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">₹{lawyer.consultation_fee}</div>
              <div className="text-sm text-gray-500">Consultation Fee</div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Case Description */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Describe Your Case</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Case Description (10-200 characters)
                </label>
                <Textarea
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  placeholder="Brief description of your legal issue..."
                  maxLength={200}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {caseDescription.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={locationType === 'court'}
                      onChange={() => setLocationType('court')}
                      className="mr-2"
                    />
                    Court
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={locationType === 'police_station'}
                      onChange={() => setLocationType('police_station')}
                      className="mr-2"
                    />
                    Police Station
                  </label>
                </div>
              </div>

              {locationType === 'court' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Court</label>
                  <Select value={courtId} onValueChange={setCourtId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a court" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court: any) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={handleStep1Submit} 
                disabled={loading || caseDescription.length < 10}
                className="w-full"
                size="lg"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: AI Summary Review */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6">Review Summary</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Your Description:</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700">{caseDescription}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">AI-Generated Summary:</h3>
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
                  <p className="text-gray-800">{aiSummary}</p>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  This summary will be sent to the lawyer. If it's not accurate, edit your description and regenerate.
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm font-medium mb-2">Edit Description (optional)</label>
                <Textarea
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <Button 
                  variant="outline" 
                  onClick={handleRegenerateSummary}
                  disabled={loading}
                  className="mt-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Regenerate Summary
                </Button>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Consultation Fee:</span>
                  <span className="text-3xl font-bold text-blue-600">₹{lawyer.consultation_fee}</span>
                </div>

                <Button 
                  onClick={handleConfirmAndPay}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingCreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>}>
      <BookingCreateContent />
    </Suspense>
  );
}
```

---

## 🟢 PHASE 3: USER DASHBOARD (Build Third - 3 hours)

### 5. USER DASHBOARD

**File:** `/app/dashboard/page.tsx`

Must include:
- Welcome message
- Stats cards (bookings count)
- Upcoming consultations
- Recent bookings list
- Quick actions

### 6. MY BOOKINGS PAGE

**File:** `/app/dashboard/bookings/page.tsx`

Must show:
- All user bookings with status
- Filter by status (pending, accepted, completed, cancelled)
- Booking cards with lawyer info
- Action buttons (cancel, join, review)

---

## ⚡ CRITICAL REQUIREMENTS

### MUST HAVE FOR LAUNCH:

1. **Environment Variables** - Add to Vercel:
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
NEXT_PUBLIC_AGORA_APP_ID=xxx
```

2. **Meta Tags** - Already added in layout.tsx

3. **Error Handling** - Every API call must have try-catch

4. **Loading States** - Show spinners while data loads

5. **Empty States** - Show helpful messages when no data

6. **Mobile Responsive** - Test on mobile devices

7. **Form Validation** - Validate all inputs before submission

---

## 🚀 DEPLOYMENT CHECKLIST

After implementation, test these:

```
□ Homepage loads
□ Search page shows real lawyers
□ Can filter by location
□ Can filter by specialization
□ Lawyer profile loads
□ Can register new user
□ Can login
□ OTP verification works
□ Can create booking
□ AI summary generates
□ Razorpay payment opens
□ Payment success redirects
□ Booking appears in dashboard
```

---

## 📊 SUCCESS METRICS

After launch, track:
- Homepage → Search: 50%+
- Search → Profile: 40%+
- Profile → Book: 20%+
- Book → Payment: 80%+
- **Overall Conversion:** 3-5%

---

## FINAL NOTES

**Timeline:**
- Phase 1 (Search + Auth): 6 hours
- Phase 2 (Booking): 4 hours
- Phase 3 (Dashboard): 3 hours
- Testing: 2 hours
- **Total: 15 hours = 2 days**

**You're building:**
✅ Search page with real API
✅ Login/Register with OTP
✅ Lawyer profiles
✅ Booking creation with AI
✅ Razorpay payment integration
✅ User dashboard

**After this, you'll have a FULLY FUNCTIONAL platform ready for commercial launch!**

Build in the order shown. Test each phase before moving to next. Deploy when Phase 1 is done, then add Phases 2 & 3.

**GO BUILD IT! 🚀**