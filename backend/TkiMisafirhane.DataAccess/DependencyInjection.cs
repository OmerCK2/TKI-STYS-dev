using Microsoft.Extensions.DependencyInjection;
using TkiMisafirhane.Core.Interfaces;
using TkiMisafirhane.DataAccess.Context;
using TkiMisafirhane.DataAccess.Repositories;

namespace TkiMisafirhane.DataAccess
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDataAccess(this IServiceCollection services, string projectId, string credentialsPath)
        {
            services.AddSingleton(new FirestoreDbContext(projectId, credentialsPath));

            services.AddScoped<IRoomRepository, RoomRepository>();
            services.AddScoped<IGuestRepository, GuestRepository>();
            services.AddScoped<IReservationRepository, ReservationRepository>();
            services.AddScoped<IInvoiceRepository, InvoiceRepository>();
            services.AddScoped<IExtraChargeRepository, ExtraChargeRepository>();
            services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }

        public static IServiceCollection AddDataAccess(this IServiceCollection services, string projectId)
        {
            services.AddSingleton(new FirestoreDbContext(projectId));

            services.AddScoped<IRoomRepository, RoomRepository>();
            services.AddScoped<IGuestRepository, GuestRepository>();
            services.AddScoped<IReservationRepository, ReservationRepository>();
            services.AddScoped<IInvoiceRepository, InvoiceRepository>();
            services.AddScoped<IExtraChargeRepository, ExtraChargeRepository>();
            services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }
    }
}
