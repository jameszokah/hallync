"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  action: string
  entity_type: string
  entity_id: string
  user_id: string
  created_at: string
  users: {
    email: string
    first_name: string | null
    last_name: string | null
  }
}

interface AdminRecentActivityProps {
  activities: Activity[]
}

export function AdminRecentActivity({ activities }: AdminRecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent actions taken by users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Recent actions taken by users on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {activity.users.first_name?.[0] || activity.users.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.users.first_name
                    ? `${activity.users.first_name} ${activity.users.last_name}`
                    : activity.users.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action} a {activity.entity_type}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
