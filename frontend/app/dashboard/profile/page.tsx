"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>
                                Make changes to your account here. Click save when you're done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Change Avatar</Button>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" defaultValue="John Doe" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="john.doe@example.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" defaultValue="+91 9876543210" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password here. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="current">Current password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">New password</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="confirm">Confirm password</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Update Password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
