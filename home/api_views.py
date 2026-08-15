from django.contrib.auth.models import User
from rest_framework import generics, permissions, status, viewsets, mixins
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count
from django.shortcuts import get_object_or_404

from .models import Categories, Products, Reviews, Cart, Orders, OrderItems
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ReviewSerializer,
    CartSerializer,
    OrderSerializer,
    CheckoutSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = UserSerializer(user, context=self.get_serializer_context()).data
        return Response(data, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CategoryListView(generics.ListAPIView):
    queryset = Categories.objects.annotate(product_count=Count('products'))
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Products.objects.select_related('category').all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering')
        if category:
            queryset = queryset.filter(category__category_id=category)
        if search:
            queryset = queryset.filter(name__icontains=search)
        if ordering == 'price':
            queryset = queryset.order_by('price')
        elif ordering == '-price':
            queryset = queryset.order_by('-price')
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Products.objects.select_related('category').all()
    serializer_class = ProductSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Reviews.objects.filter(product_id=self.kwargs['pk']).select_related('customer')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(product_id=self.kwargs['pk'])


class CartView(generics.ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).select_related('product', 'product__category')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CartItemView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        quantity = request.data.get('quantity')
        if quantity is not None and int(quantity) < 1:
            return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Orders.objects
            .filter(user=self.request.user)
            .prefetch_related('orderitems_set__product')
            .order_by('-order_date')
        )


class CheckoutView(generics.CreateAPIView):
    serializer_class = CheckoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        cart_count = Cart.objects.filter(user=request.user).count()
        if cart_count == 0:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
