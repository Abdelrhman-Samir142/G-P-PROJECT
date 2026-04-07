from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class AIUserRateThrottle(UserRateThrottle):
    scope = 'ai_user'

class AIAnonRateThrottle(AnonRateThrottle):
    scope = 'ai_anon'
