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
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, total_pages: 1 });

  // Location states
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);

  // Specialization states
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [subSpecializations, setSubSpecializations] = useState<any[]>([]);

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
      {/* Note: I'm not rendering the header here because it's in layout.tsx? 
         Wait, layout.tsx has Header. 
         But prompt code has inline nav.
         I will remove the inline nav if app/layout.tsx already has a Header.
         Checking layout.tsx later. For now, assuming standard app directory structure, Header is in layout. 
         Wait, let's keep it safe. The prompt has:
         <nav className="border-b bg-white"> ... </nav>
         If I include this, I might have double headers.
         The existing app/layout.tsx definitely has <Header />.
         So I should REMOVE the nav from this page content to avoid double header.
     */}

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
                {[1, 2, 3, 4, 5].map(i => (
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
                            <AvatarFallback className="text-xl">{lawyer.name?.[0] || 'L'}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-xl font-semibold">{lawyer.name || 'Unnamed Lawyer'}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => {
                                      const averageRating = typeof lawyer.average_rating === 'number' ? lawyer.average_rating : 0;
                                      return (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${i < Math.floor(averageRating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {typeof lawyer.average_rating === 'number' ? lawyer.average_rating.toFixed(1) : '0.0'} ({lawyer.total_reviews || 0} reviews)
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
                                <span className="truncate">{lawyer.years_experience} years exp.</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Languages className="h-4 w-4" />
                                <span className="truncate">{lawyer.languages?.join(', ')}</span>
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
