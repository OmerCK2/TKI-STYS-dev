import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalrService implements OnDestroy {
  private hubConnection: HubConnection | null = null;
  private roomStatusSubject = new BehaviorSubject<any>(null);
  private connectionStateSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
  private destroy$ = new Subject<void>();

  readonly roomStatus$ = this.roomStatusSubject.asObservable();
  readonly connectionState$ = this.connectionStateSubject.asObservable();

  connect(): void {
    const token = localStorage.getItem('auth_token');

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalRUrl, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    this.hubConnection.on('RoomStatusUpdated', (data) => {
      this.roomStatusSubject.next(data);
    });

    this.hubConnection.on('Connected', (message) => {
      console.log('SignalR:', message);
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStateSubject.next(HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStateSubject.next(HubConnectionState.Connected);
    });

    this.hubConnection.onclose(() => {
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
    });

    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    if (!this.hubConnection) return;

    try {
      await this.hubConnection.start();
      this.connectionStateSubject.next(HubConnectionState.Connected);
    } catch (err) {
      console.error('SignalR bağlantı hatası:', err);
      this.connectionStateSubject.next(HubConnectionState.Disconnected);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  disconnect(): void {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      this.hubConnection.stop();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
