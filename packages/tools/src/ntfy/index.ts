type NtfyHeaders = {
  Authorization: string
  Title: string
  Click?: string
  Priority?: string
  Icon?: string
  Tags?: string
}

export const sendNotification = async ({
  topic,
  title,
  message,
  tags,
  click,
  priority = 'default',
  icon,
  client,
  options: { NTFY_HOST, NTFY_ACCESS_TOKEN }
}: {
  topic: string
  title?: string
  message: string
  tags?: string
  click?: string
  priority?: 'urgent' | 'high' | 'default' | 'low' | 'min'
  icon?: string
  client?: {
    host: string
  }
  options: {
    NTFY_HOST: string
    NTFY_ACCESS_TOKEN: string
  }
}) => {
  const headers: NtfyHeaders = {
    Authorization: `Bearer ${NTFY_ACCESS_TOKEN}`,
    Title: `${client ? `${client.host}: ` : ``}${title}`,
    Click: click ? click : client ? `https://${client.host}` : '',
    Priority: priority,
    Icon: `${icon ? icon : `${client ? `https://${client.host}/favicon-128.png` : ``}`}`
  }
  if (tags) headers.Tags = tags

  return fetch(`https://${NTFY_HOST}/${topic}`, {
    method: 'POST',
    body: `${message}`,
    headers
  })
    .then(() => {
      return { success: true }
    })
    .catch((e) => {
      return { success: false, errorMessage: e as string }
    })
}
