from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import UserAgent
from .serializers import UserAgentSerializer

class UserAgentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for AI Auto-Bidder agents.
    Users can create, view, update, and delete their own agents.
    """
    serializer_class = UserAgentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAgent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agent_targets(request):
    """
    Return all available YOLO target items for the agent dropdown.
    """
    from ai.classifier import get_available_targets
    targets = get_available_targets()
    return Response(targets)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def classify_image_view(request):
    """
    Accept an image file and return the predicted product category
    using the YOLO model.
    """
    image_file = request.FILES.get('image')
    if not image_file:
        return Response(
            {'error': 'No image file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    import tempfile
    import os
    from ai.classifier import classify_image

    # Save to temp file for YOLO inference
    suffix = os.path.splitext(image_file.name)[1] or '.jpg'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='wb') as tmp:
        for chunk in image_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        result = classify_image(tmp_path)
        return Response(result)
    finally:
        os.unlink(tmp_path)
