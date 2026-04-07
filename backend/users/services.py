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

    @staticmethod
    def hold_funds(user: User, amount: Decimal | int | float | str) -> 'UserProfile':
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError('Hold amount must be greater than zero.')
            
        profile = user.profile
        wallet_balance = profile.wallet_balance or Decimal('0.00')
        held_balance = profile.held_balance or Decimal('0.00')
        available_balance = wallet_balance - held_balance
        
        if available_balance < amount:
            raise ValueError(f'Insufficient available balance. Available: {available_balance}, Required: {amount}')
            
        profile.held_balance = held_balance + amount
        profile.save(update_fields=['held_balance'])
        return profile

    @staticmethod
    def release_funds(user: User, amount: Decimal | int | float | str) -> 'UserProfile':
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError('Release amount must be greater than zero.')
            
        profile = user.profile
        held_balance = profile.held_balance or Decimal('0.00')
        
        if held_balance < amount:
            # Maybe warning or just cap it
            profile.held_balance = Decimal('0.00')
        else:
            profile.held_balance = held_balance - amount
            
        profile.save(update_fields=['held_balance'])
        return profile

    @staticmethod
    def commit_funds(user: User, amount: Decimal | int | float | str) -> 'UserProfile':
        amount = Decimal(str(amount))
        if amount <= 0:
            raise ValueError('Commit amount must be greater than zero.')
            
        profile = user.profile
        wallet_balance = profile.wallet_balance or Decimal('0.00')
        held_balance = profile.held_balance or Decimal('0.00')
        
        # We decrement from both wallet and held balance
        profile.wallet_balance = wallet_balance - amount
        
        if held_balance < amount:
            profile.held_balance = Decimal('0.00')
        else:
            profile.held_balance = held_balance - amount
            
        profile.save(update_fields=['wallet_balance', 'held_balance'])
        return profile
