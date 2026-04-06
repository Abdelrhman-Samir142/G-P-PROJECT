from decimal import Decimal, InvalidOperation

from django.contrib.auth.models import User


class WalletService:
    @staticmethod
    def recharge_wallet(user: User, amount: Decimal | int | float | str) -> 'UserProfile':
        if amount is None:
            raise ValueError('Recharge amount is required.')

        if isinstance(amount, Decimal):
            decimal_amount = amount
        else:
            try:
                decimal_amount = Decimal(str(amount))
            except (InvalidOperation, ValueError, TypeError):
                raise ValueError('Recharge amount must be a valid decimal number.')

        if decimal_amount <= 0:
            raise ValueError('Recharge amount must be greater than zero.')

        profile = user.profile
        profile.wallet_balance = (profile.wallet_balance or Decimal('0.00')) + decimal_amount.quantize(Decimal('0.01'))
        profile.save(update_fields=['wallet_balance'])
        return profile
