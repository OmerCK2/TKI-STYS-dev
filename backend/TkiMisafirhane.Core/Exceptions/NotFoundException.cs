using System;

namespace TkiMisafirhane.Core.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string name, object key) 
            : base($"\"{name}\" ({key}) kaydı sistemde bulunamadı.")
        {
        }
    }
}