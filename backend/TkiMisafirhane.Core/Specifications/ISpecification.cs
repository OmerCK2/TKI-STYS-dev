using System;
using System.Linq.Expressions;

namespace TkiMisafirhane.Core.Specifications
{
    public interface ISpecification<T>
    {
        Expression<Func<T, bool>> Criteria { get; }
    }
}