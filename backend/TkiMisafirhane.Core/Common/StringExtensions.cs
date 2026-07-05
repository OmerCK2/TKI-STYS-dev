using System;

namespace TkiMisafirhane.Core.Common
{
    public static class StringExtensions
    {
        public static string MaskNationalId(this string nationalId)
        {
            if (string.IsNullOrEmpty(nationalId) || nationalId.Length != 11)
                return nationalId;

            return nationalId.Substring(0, 3) + "*****" + nationalId.Substring(8, 3);
        }
    }
}