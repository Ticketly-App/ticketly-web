'use client'

import { use } from 'react'
import { EventDetail } from '@/components/event/event-detail'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <EventDetail eventKey={id} />
}



