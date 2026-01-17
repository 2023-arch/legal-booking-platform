import Link from 'next/link';
import { Scale, Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Scale className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl">LegalBook</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Connecting you with verified legal experts across India. Simple, secure, and reliable.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Facebook className="h-5 w-5 hover:text-blue-500 cursor-pointer transition-colors" />
                            <Twitter className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
                            <Linkedin className="h-5 w-5 hover:text-blue-600 cursor-pointer transition-colors" />
                            <Instagram className="h-5 w-5 hover:text-pink-500 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Platform</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/search" className="hover:text-white transition-colors">Find Lawyers</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/reviews" className="hover:text-white transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Legal Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                <span>Tech Park, Bangalore, India</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-500" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span>support@legalbook.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} LegalBook Platform. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
