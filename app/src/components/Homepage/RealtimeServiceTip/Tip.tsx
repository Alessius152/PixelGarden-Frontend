import { Button, Portal, Text, Tooltip } from "@chakra-ui/react"
import { useRealtime } from "../../../contexts/RealtimeContext"
import type { ConnectionState } from "ably"

function Tip() {
    const { client, connState } = useRealtime()

    return <>
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <Text fontSize={'x-small'} as={'span'}>Realtime: {(() => {
                    const _ = connState
                    let color: string = 'black'
                    if (!_) color = 'grey'
                    if (_ === 'connected') color = 'green'
                    if (_ === 'connecting') color = 'goldenrod'
                    if (_ === 'closed') color = 'red'
                    if (_ === 'closing') color = 'red'
                    if (_ === 'disconnected') color = 'red'
                    if (_ === 'failed') color = 'red'
                    if (_ === 'suspended') color = 'brown'
                    return <b style={{ color }}>{connState || 'undefined'}</b>
                })()}</Text>
            </Tooltip.Trigger>
            <Portal>
                <Tooltip.Positioner>
                    <Tooltip.Content>
                        Questo indicatore segnala lo stato della connessione del tuo browser verso il PaaS gestore delle notifiche in tempo reale.
                        <br /><br />
                        Il PaaS in questione si occupa di inviare notifiche ai browser connessi all'app.
                        <br /><br />
                        Ad esempio, se un utente ti invia una richiesta di amicizia, o un invito a entrare a far parte di una stanza di lavoro, o ti
                        cancella l'amicizia, l'app in esecuzione nel tuo browser deve aggiornare l'interfaccia utente, per mostrarti le modifiche e farti
                        vedere la lista di amici aggiornata, piuttosto che la lista delle richieste di amicizia ecc.
                        <br /><br />
                        Se l'indicatore dice "connected", è sicuro che le notifiche le riceverai, se per caso invece non è cosi, potresti perdere aggiornamenti.
                    </Tooltip.Content>
                </Tooltip.Positioner>
            </Portal>
        </Tooltip.Root>
        {
            ((['failed', 'closed', 'suspended', 'disconnected', undefined] as (ConnectionState | undefined)[]).includes(client?.connection.state)) && (
                <Button ml={1} boxSize={'16px'} fontSize={'2xs'}
                    onClick={() => {
                        if (!client) return

                        if (client.connection.state === 'closed' || client.connection.state === 'failed') {
                            window.location.reload() 
                        } else {
                            client.connect()
                        }
                    }}
                >Riprova</Button>
            )
        }
    </>
}

export default Tip
