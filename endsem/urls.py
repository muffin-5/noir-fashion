"""
URL configuration for endsem project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from home import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from home import api_views

urlpatterns = [
    path('admin/', admin.site.urls),
]

# Legacy server-rendered template pages. Retained for local development only;
# in production the React SPA (below) serves the frontend instead.
if settings.DEBUG:
    urlpatterns += [
        path('', views.home, name='home'),
        path('login/', views.login, name='login'),
        path('signup/', views.signup, name='signup'),
        path('logout/', views.logout, name='logout'),
        path('products/', views.products, name='products'),
        path('products/<int:pk>/', views.item, name='item'),
        path('cart/', views.cart, name='cart'),
        path('cart/remove/<int:pk>', views.cart_remove, name='cart_remove'),
        path('add_to_cart/<int:pk>', views.add_to_cart, name='add_to_cart'),
        path('checkout/', views.checkout, name='checkout'),
        path('profile/', views.profile, name='profile'),
        path('buy/<int:pk>', views.buy, name='buy'),
    ]

api_urlpatterns = [
    path('auth/register/', api_views.RegisterView.as_view()),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', api_views.MeView.as_view()),
    path('categories/', api_views.CategoryListView.as_view()),
    path('products/', api_views.ProductListView.as_view()),
    path('products/<int:pk>/', api_views.ProductDetailView.as_view()),
    path('products/<int:pk>/reviews/', api_views.ReviewListCreateView.as_view()),
    path('cart/', api_views.CartView.as_view()),
    path('cart/<int:pk>/', api_views.CartItemView.as_view()),
    path('orders/', api_views.OrderListView.as_view()),
    path('orders/checkout/', api_views.CheckoutView.as_view()),
]

urlpatterns += [
    path('api/', include((api_urlpatterns, 'api'), namespace='api')),
]

# Serve uploaded product images in both dev and production (works because media
# lives in the repo for this demo).
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve the React SPA for client-side routes in production.
if not settings.DEBUG:
    urlpatterns += [
        path('', views.spa),
        path('<path:path>', views.spa),
    ]